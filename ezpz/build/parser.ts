import { parse } from '@babel/parser'
import { v4 as uuidv4 } from 'uuid'
import * as t from '@babel/types'
import { transformFromAstSync, traverse } from '@babel/core'
import { _LoadFunctionDataBuilder } from 'ezpz/types'

const devDefinedInitIdUnique: Map<string, string> = new Map()

export const parseComponent = (filePath: string, fileContents: string) => {
  const componentType = filePath.endsWith('index.tsx') ? 'page' : 'layout'

  // uci = unique component identifier
  const uci = filePath
    .replace('./src/pages/', '')
    .replace('.tsx', '')
    .replace(new RegExp(/\//g), '_')
    .replace('index', '')
    .replace('-', '_')

  const fileAst = parse(fileContents, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })

  let defaultExportName: string = ''
  const functions: {
    [key: string]: {
      id: t.Identifier
      name: string
      type: string
      content: string
      start: number
      end: number
    }
  } = {}

  fileAst.program.body.forEach((node: t.Node) => {
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
        id: node.id,
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
      if (!(node.declarations[0]?.id as t.Identifier).name) return
      if (!node.start) return
      if (!node.end) return

      functions[(node.declarations[0]?.id as t.Identifier).name] = {
        id: node.declarations[0]?.id as t.Identifier,
        name: (node.declarations[0]?.id as t.Identifier).name,
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

  const componentLoadFunctionData: _LoadFunctionDataBuilder[] = []
  const componentLoadFunctionInitInserts: number[] = []
  const componentLoadFunctions: string[] = []
  const componentLoadFunctionUIDs: string[] = []
  const componentLoadFunctionsLoadOnServer: boolean[] = []

  // @ts-expect-error declarations type from package is incorrect
  componentAst.program.body[0].declarations[0].init.body.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      if (node.declarations[0].init.callee?.name === 'useServer') {

        const variables = node.declarations[0].id.elements
        checkVariableNames(variables)

        let loadFunctionUid: string | undefined = undefined

        node.declarations[0].init.arguments[2].properties.some((prop) => {
          if (prop.key.name === 'loadOn') {
            if (prop.value.value === 'server') {
              componentLoadFunctionsLoadOnServer.push(true)
            } else {
              componentLoadFunctionsLoadOnServer.push(false)
            }
          }
          if (prop.key.name === 'serverSyncId') {
            if (typeof prop.value.value === 'string') {
              // regex throw an error if prop.value.value could not be used as a function name in javascript
              if (!prop.value.value.match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)) {
                throw new Error(`serverSyncId must be a string that could resolve to valid function name, see: ${defaultExportName} / ${prop.value.value}`)
              }
              if (devDefinedInitIdUnique.has(prop.value.value)) {
                throw new Error(`serverSyncId must be unique to each useSever hook, see: ${defaultExportName} / ${prop.value.value}. If you want to use the same value elsewhere, check out the useServerSync hook`)
              }
              devDefinedInitIdUnique.set(prop.value.value, defaultExportName)
              loadFunctionUid = `__dev_defined__${prop.value.value}`
              prop.value.value = loadFunctionUid
            } else {
              throw new Error(`serverSyncId must be a string, see: ${defaultExportName}`)
            }
          }
        })

        if (!loadFunctionUid) {
          const lf_cui = `lf_${uuidv4().replaceAll('-', '_')}`
          loadFunctionUid = lf_cui
          node.declarations[0].init.arguments[2].properties.push(
            t.objectProperty(
              t.identifier('serverSyncId'),
              t.stringLiteral(lf_cui),
            ),
          )
        }

        node.declarations[0].init.arguments[2].properties.push(
          t.objectProperty(
            t.identifier('serverInit'),
            t.identifier(loadFunctionUid),
          ),
        )

        node.declarations[0].init.arguments[1].properties.forEach((prop) => {
          if (prop.key.name === 'loadFunction') {
            componentLoadFunctionUIDs.push(loadFunctionUid!)
            componentLoadFunctions.push(componentCode.substring(
              prop.value.start, prop.value.end,
            ).replace(/[\n\s]+/g, ' '))
          }
        })

        componentLoadFunctionInitInserts.push(
          componentStart + node.declarations[0].init.arguments[2].start,
        )
      } else if (node.declarations[0].init.callee?.name === 'useServerSync') {
        const variables = node.declarations[0].id.elements
        checkVariableNames(variables)

        // const loadFunctionUid: string = `"__$!replace!$__${node.declarations[0].init.arguments[0].value}__$!replace!$__"`
        // const loadFunctionUid: string = `"${node.declarations[0].init.arguments[0].value}"`

        // node.declarations[0].init.arguments[2].properties.push(
        //   t.objectProperty(
        //     t.identifier('serverInit'),
        //     t.identifier(loadFunctionUid),
        //   ),
        // )
      }
    }
  })

  replaceFunctionByIdName(
    fileAst,
    functions[defaultExportName!].id,
    componentAst,
  )

  const compiledSsr = transformFromAstSync(fileAst)?.code
  if (!compiledSsr) throw new Error('could not compile ssr code: ' + filePath)

  let compiledCsr = compiledSsr
  if (!compiledCsr) throw new Error('could not compile csr code: ' + filePath)

  componentLoadFunctionUIDs.forEach((uid, i) => {
    const regex = new RegExp(`serverInit: ${uid}`, 'g')
    compiledCsr = (compiledCsr || '').replace(regex, '')

    componentLoadFunctionData.push({
      loadFunction: componentLoadFunctions[i],
      uid: uid,
      loadOnServer: componentLoadFunctionsLoadOnServer[i],
    })
  })

  // this is adding an array of the load function data to the end of the file
  const addedLoadFunctionDataSsr = compiledSsr.concat(`\n\nexport const loadFunctionData = [${componentLoadFunctionData.map((x) => {
    return `{
    loadFunction: ${x.loadFunction},
    uid: '${x.uid}',
    loadOnServer: ${x.loadOnServer},
}`
  })}]`)

  const addedReactImportSsr = 'import * as React from \'react\'\n'.concat(addedLoadFunctionDataSsr)

  // TODO: make this happen with babel
  // this needs to be more robust, pretty sure it doesnt work at all for export default function syntax
  let addedLoadFunctionProps = ''

  if (filePath.endsWith('index.tsx')) {
    addedLoadFunctionProps = addedReactImportSsr
      .replace(
        new RegExp(`const ${defaultExportName}(.*)= \\((.*)\\) => {`),
        `const ${defaultExportName}$1= ({${componentLoadFunctionUIDs.map((x) => `${x}`).join(',')}}) => {`,
      ).replace(
        new RegExp(`export default function ${defaultExportName}\\((.*)\\) {`),
        `export default function ${defaultExportName}($1) {`,
      )
  } else if (filePath.endsWith('layout.tsx')) {
    addedLoadFunctionProps = addedReactImportSsr
      .replace(
        new RegExp(`const ${defaultExportName}[\\s\\S]*=[\\s\\S]*\\({[\\s\\S]*}\\)(.*)=>(.*){`),
        `const ${defaultExportName}$1= ({children,${componentLoadFunctionUIDs.map((x) => `${x}`).join(',')}}) => {`,
      ).replace(
        new RegExp(`export default function ${defaultExportName}\\((.*)\\) {`),
        `export default function ${defaultExportName}($1) {`,
      )
  }


  return {
    defaultExportName,
    uci,
    fileContentsCsr: compiledCsr,
    fileContentsSsr: addedLoadFunctionProps,
    loadFunctions: componentLoadFunctions,
    loadFunctionInserts: componentLoadFunctionInitInserts,
    loadFunctionUIDs: componentLoadFunctionUIDs,
    loadFunctionsLoadOnServer: componentLoadFunctionsLoadOnServer,
  }
}


function replaceFunctionByIdName(ast, targetId, newContentAst) {
  traverse(ast, {
    FunctionDeclaration(path) {
      // Check if the function has the specified id
      if (t.isIdentifier(path.node.id) && path.node.id === targetId) {
        // Replace the function with the new content AST
        path.replaceWith(newContentAst)
      }
    },
    VariableDeclaration(path) {
      // Check if the function has the specified id
      if (t.isIdentifier(path.node.declarations[0]?.id) && path.node.declarations[0]?.id === targetId) {
        // Replace the function with the new content AST
        path.replaceWith(newContentAst)
      }
    },
  })
}




const checkVariableNames = (variables: { name: string }[]) => {
  const capped_var_1_name = variables[0].name.charAt(0).toUpperCase() + variables[0].name.slice(1)

  if (
    variables[1]?.name &&
    variables[1].name !== `setLocal${capped_var_1_name}`
  ) {
    throw new Error('a local setter function name is incorrect: must start with setLocal')
  }

  if (
    variables[2]?.name &&
    variables[2].name !== `setServer${capped_var_1_name}`
  ) {
    throw new Error('a local setter function name is incorrect: must start with setServer')
  }

  if (
    variables[3]?.name &&
    variables[3].name !== `statusOf${capped_var_1_name}`
  ) {
    throw new Error('a status value name is incorrect')
  }
}




export default parseComponent