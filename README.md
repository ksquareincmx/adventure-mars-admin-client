# Adventure Mars Admin Client

Table of contents

1. [Pre requirements](#pre-requirements)
2. [Configuration](#configutarion)
3. [Running the project](#running-the-project)
4. [Production build](#production-build)

## Pre requirements

- nodejs >= 8.x
- npm
- ionic
- cordova

To install `node` and `npm` you can use `nvm`, you can find the instructions [here](https://github.com/creationix/nvm)

Once you have `node` and `npm` installed you need to install `ionic` to do that you can run the following command:

```
npm install -g ionic
```

You can install cordova running the following command:

```
npm install -g cordova
```

## Configuration

First you need to install all your dependencies. You can do that running this command:

```
npm install
```

## Running the project

To run the application on `dev` mode you must execute following command:

```
ionic serve
```

## Production build

You can build for production running the following command:

```
ionic cordova build browser --prod
```
