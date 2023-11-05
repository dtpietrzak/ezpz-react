import fs from 'fs'
import { parse } from '@babel/parser'
import { transformFromAstSync } from '@babel/core'
import {
  Node,
  Identifier,
} from '@babel/types'

export const parseComponent = (filePath: string) => {
  let fileContents = fs.readFileSync(filePath, 'utf8')

  // uci = unique component identifier
  const uci = filePath
    .replace('./src/pages/', '')
    .replace('.tsx', '')
    .replace(new RegExp(/\//g), '_')
    .replace('index', '')

  const ast = parse(fileContents, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })


  let defaultExportName: string = ''
  const functions: {
    [key: string]: {
      name: string
      type: string
      content: any
      start: number
      end: number
    }
  } = {}

  ast.program.body.forEach((node: Node) => {
    if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.loc?.identifierName) {
        defaultExportName = node.declaration.loc?.identifierName
      }
    }

    // if (node.type === 'ExportNamedDeclaration') {
    //   if (!(node.declaration as VariableDeclaration)?.[0]?.id?.name) return
    //   if (!node.start) return
    //   if (!node.end) return

    //   // @ts-expect-error
    //   functions[node.declaration.declarations?.[0]?.id.name] = {
    //     // @ts-expect-error
    //     name: node.declaration.declarations?.[0]?.id.name,
    //     type: node.type,
    //     content: fileContents.substring(
    //       node.start,
    //       node.end,
    //     )
    //   }
    // }

    if (node.type === 'FunctionDeclaration') {
      if (!node.id) return
      if (!node.start) return
      if (!node.end) return

      functions[node.id.name] = {
        name: node.id.name,
        type: node.type,
        content: fileContents.substring(
          node.start,
          node.end,
        ),
        start: node.start,
        end: node.end,
      }
    }
    if (node.type === 'VariableDeclaration') {
      if (!(node.declarations[0]?.id as Identifier).name) return
      if (!node.start) return
      if (!node.end) return

      functions[(node.declarations[0]?.id as Identifier).name] = {
        name: (node.declarations[0]?.id as Identifier).name,
        type: node.type,
        content: fileContents.substring(
          node.start,
          node.end,
        ),
        start: node.start,
        end: node.end,
      }
    }
  })

  if (!functions[defaultExportName!]) return

  const componentCode = functions[defaultExportName!].content
  const componentStart = functions[defaultExportName!].start

  const componentAst = parse(componentCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })

  const componentLoadFunctions: string[] = []
  const componentLoadFunctionNames: string[] = []
  const componentLoadFunctionInitInserts: number[] = []

  // @ts-expect-error
  componentAst.program.body[0].declarations[0].init.body.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      if (node.declarations[0].init.callee.name === 'useServer') {

        const variables = node.declarations[0].id.elements
        const capped_var_1_name = variables[0].name.charAt(0).toUpperCase() + variables[0].name.slice(1)

        if (variables[1].name !== `update${capped_var_1_name}`) {
          throw new Error('an update function name is incorrect')
        }

        if (variables[2].name !== `statusOf${capped_var_1_name}`) {
          throw new Error('a status value name is incorrect')
        }

        let loadOnServer: boolean = false

        node.declarations[0].init.arguments[2].properties.some((prop) => {
          if (prop.key.name === 'loadOn') {
            if (prop.value.value === 'server') {
              loadOnServer = true
            }
          }
        })

        if (!loadOnServer) return

        node.declarations[0].init.arguments[1].properties.forEach((prop) => {
          if (prop.key.name === 'loadFunction') {
            componentLoadFunctionNames.push(`${uci}${variables[0].name}`)
            componentLoadFunctions.push(
              `export const ${uci}${variables[0].name} = ${componentCode.substring(prop.value.start, prop.value.end)}`
            )
          }
        })

        componentLoadFunctionInitInserts.push(
          componentStart + node.declarations[0].init.arguments[2].start,
        )
      }
    }
  })

  componentLoadFunctionInitInserts
    .sort((a, b) => b - a)
    .forEach((insert, i) => {
      fileContents = addStringAtIndex(
        fileContents,
        `\n    serverInit: ${componentLoadFunctionNames[componentLoadFunctionNames.length - i - 1]}_init,`,
        insert + 1,
      )
    })

  const newFileContents = [fileContents, componentLoadFunctions.join('\n\n')].join('\n\n').concat(`\n\nexport const loadFunctions = ${JSON.stringify(componentLoadFunctionNames)}`)

  return {
    defaultExportName,
    uci,
    newFileContents,
    loadFunctionNames: componentLoadFunctionNames,
  }
}

// make a function to add a string to another string starting at a certain index
function addStringAtIndex(
  originalString: string,
  stringToAdd: string,
  index: number,
): string {
  return originalString.slice(0, index) + stringToAdd + originalString.slice(index);
}

export default parseComponent