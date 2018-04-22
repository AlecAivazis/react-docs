# react-docs
A utility to generate documentation for every component exported by a single file

## Usage

The primary usecase for `react-docs` is to collect a description of every component
exported by a particular module. Currently `react-docs` only supports collecting prop 
information by looking for FlowType definitions. For example:

```javascript
import { collectExports } from 'react-docs'

// the path of the root index.js of a package/module that we want to document
const { components } = await collectExports('/absolute/path/to/my/package/index.js')

// do something with the list of components
console.log(components)
```

The description of each component is returned as an object of the form:
```
{
    filepath: String // the absolute path to the component declaration
    props: {
        prop1: {
            value: String      // a pretty printed string of the flow definition
            required: Boolean  // whether the prop is required or not
            nullable: Boolean  // whether `null` is a valid value
        }
    }
}
```

note: The prop table for the exported types is also returned under the `types` field.


### Aliasing global packages

By default (for now), `react-docs` will ignore types imported from global packages. In order to provide 
a location to retrieve definitions from a global package, you can pass a second argument to `collectExports`
that provides location aliases, for example:

```
await collectExports('/absolute/path/to/my/package/index.js'> {
    alias: {
        "quark-core": path.resolve(__dirname, "node_modules", "quark_core", "src", "index.js")
    }
})
```
