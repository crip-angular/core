# Crip Angular core module

![alt tag](https://avatars1.githubusercontent.com/u/16862447?v=3&s=200)

For more details [see demo repository](https://github.com/crip-angular/demo)

Mainly contains helper functions for angular and javascript.
This module is used as dependency almost in all crip environment applications.

## Angular functions

### isEmpty ( {*} value ) : {boolean}

Determines is value presented in object. If value is undefined, `null`, empty string 
or `NaN`, method will return `true`

### hasValue ( {*} value ) : {boolean}

Exactly opposite method of `isEmpty`.

### hasProperty ( {object} object , {...string} properties ) : {boolean}

Determines is key presented in object:

```js
    angular.hasProperty({prop1: false}, 'prop1'); // true
    angular.hasProperty({prop1: {prop2: 'test'}}, 'prop1', 'prop2'); // true
    angular.hasProperty({prop1: {prop2: 'test'}}, 'prop3', 'prop2'); // false
```

### nodesToArray ( {Node} nodes ) : {array}

Annoying method to copy nodes to an array, thanks to IE