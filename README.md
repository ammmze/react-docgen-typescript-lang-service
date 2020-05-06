# react-docgen-typescript-lang-service [![npm](https://img.shields.io/npm/v/react-docgen-typescript-lang-service)](https://www.npmjs.com/package/react-docgen-typescript-lang-service)
Package version of the workaround mentioned in styleguidist/react-docgen-typescript#112 to use the language service to speed up compile time for styleguidist

## Installation

```bash
npm install --save-dev react-docgen-typescript-lang-service
```

## Usage

Usage is similar to [`react-docgen-typescript`](https://www.npmjs.com/package/react-docgen-typescript).

In your `styleguide.config.js` you can do the following:

```js
propsParser: require('react-docgen-typescript-lang-service').withDefaultConfig([parserOptions]).parse
```

or with a custom config file:

```js
propsParser: require('react-docgen-typescript-lang-service').withCustomConfig('./tsconfig.json', [parserOptions]).parse
```
