// local imports
import prettyPrintType from './prettyPrintType'

const getPropTable = (content, typeAnnotation, moduleScopedTypes = {}) => {
    // the definition of the type
    let typeDef

    // if it is a reference to type annotation defined in the file
    if (typeAnnotation.type === 'GenericTypeAnnotation') {
        // get the name of the type
        const typeName = typeAnnotation.id.name

        // find the type def of the corresponding name as a locally accesible type
        let localType = content.find(node => node.type === 'TypeAlias' && node.id.name === typeName)
        // look for the matching type as an exported one
        const exportedType = content.find(
            node =>
                node.type === 'ExportNamedDeclaration' &&
                node.declaration.type === 'TypeAlias' &&
                node.declaration.id.name === typeName
        )
        if (localType) {
            typeDef = localType
        } else if (exportedType) {
            typeDef = exportedType.declaration
        }

        // if we couldn't find the type definition, it is an externally imported type
        if (!typeDef) {
            // if we have a definition for it in our global scope, use it, otherwise ignore the type
            return moduleScopedTypes[typeName] || {}
        }

        // use the defined value as the typedef
        typeDef = typeDef.right
    } else {
        // otherwise it is an inline definition
        typeDef = typeAnnotation
    }
    // if we have a single list of properties (an object)
    if (typeDef.properties) {
        return _generateTable(typeDef.properties, moduleScopedTypes)
    }
    // if its a standalone type or union
    if (!typeDef.types || typeDef.type === 'UnionTypeAnnotation') {
        // generate the prop table like normal
        return prettyPrintType(typeDef)
    }

    // otherwise we are most likely an intersection of other types so return a merge of all of the tables
    return typeDef.types.map(type => getPropTable(content, type, moduleScopedTypes)).reduce(
        (prev, curr) => ({
            ...prev,
            ...curr
        }),
        {}
    )
}

const _generateTable = properties => {
    // the props of the declaration
    const props = {}

    // for each prop in the definition
    for (const prop of properties) {
        // check if the type is nullable
        const isNullable = prop.value.type === 'NullableTypeAnnotation'

        // set the value to the prittified version
        props[prop.key.name] = {
            value: prettyPrintType(!isNullable ? prop.value : prop.value.typeAnnotation),
            required: !prop.optional,
            nullable: isNullable
        }
    }

    // return the generated prop table
    return props
}

export default getPropTable
