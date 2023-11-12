import fs from 'fs'
import { parse } from '@babel/parser'
import { v4 as uuidv4 } from 'uuid'
import {
  Node,
  Identifier,
} from '@babel/types'

const devDefinedInitIdUnique: Map<string, string> = new Map()

export const parseComponent = (filePath: string) => {
  let fileContents = fs.readFileSync(filePath, 'utf8')

  // uci = unique component identifier
  const uci = filePath
    .replace('./src/pages/', '')
    .replace('.tsx', '')
    .replace(new RegExp(/\//g), '_')
    .replace('index', '')
    .replace('-', '_')

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
  const componentLoadFunctionUIDs: string[] = []
  const componentLoadFunctionInitInserts: number[] = []
  let loadOnServer: boolean = false

  // @ts-expect-error
  componentAst.program.body[0].declarations[0].init.body.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      if (node.declarations[0].init.callee.name === 'useServer') {

        const variables = node.declarations[0].id.elements
        const capped_var_1_name = variables[0].name.charAt(0).toUpperCase() + variables[0].name.slice(1)

        if (variables[1].name !== `setLocal${capped_var_1_name}`) {
          throw new Error('a local setter function name is incorrect: must start with setLocal')
        }

        if (variables[2].name !== `setServer${capped_var_1_name}`) {
          throw new Error('a local setter function name is incorrect: must start with setServer')
        }

        if (variables[3].name !== `statusOf${capped_var_1_name}`) {
          throw new Error('a status value name is incorrect')
        }

        let devDefinedInitId: string

        node.declarations[0].init.arguments[2].properties.some((prop) => {
          if (prop.key.name === 'loadOn') {
            if (prop.value.value === 'server') {
              loadOnServer = true
            }
          }
          if (prop.key.name === 'serverInitId') {
            if (typeof prop.value.value === 'string') {
              // regex throw an error if prop.value.value could not be used as a function name in javascript
              if (!prop.value.value.match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)) {
                throw new Error(`serverInitId must be a string that could resolve to valid function name, see: ${defaultExportName} / ${prop.value.value}`)
              }
              devDefinedInitIdUnique.set(prop.value.value, defaultExportName)
              devDefinedInitId = prop.value.value
            } else {
              throw new Error(`serverInitId must be a string, see: ${defaultExportName}`)
            }
          }
        })

        const lf_cui = `lf_${uuidv4().replaceAll('-', '_')}`
        
        node.declarations[0].init.arguments[1].properties.forEach((prop) => {
          if (prop.key.name === 'loadFunction') {
            componentLoadFunctionNames.push(`${variables[0].name}`)
            componentLoadFunctionUIDs.push(
              devDefinedInitId ? `__dev_defined__${devDefinedInitId}` : lf_cui
            )
            componentLoadFunctions.push(
              `export const ${variables[0].name} = ${componentCode.substring(prop.value.start, prop.value.end)}`
            )
          }
        })

        componentLoadFunctionInitInserts.push(
          componentStart + node.declarations[0].init.arguments[2].start,
        )
      }
    }
  })

  return {
    defaultExportName,
    uci,
    fileContents,
    loadFunctions: componentLoadFunctions,
    loadFunctionInserts: componentLoadFunctionInitInserts,
    loadFunctionNames: componentLoadFunctionNames,
    loadFunctionUIDs: componentLoadFunctionUIDs,
    loadOnServer: loadOnServer,
  }
}

export default parseComponent