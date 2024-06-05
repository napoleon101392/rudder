# Project Name

This is a Node.js application that uses Docker to manage services. Currently It provides two main commands: `init` and `install`. Please note that this project is currently under development, and the command structure may change in the future.

## Commands

### `init`

The `init` command initializes the application. It is implemented in the [`Initialize`](src/commands/Initialize.js) class.

To run this command, use:

```sh
node index.js init
```

### install
The `install` command installs docker services. The install command is implemented in the [`Installation`](src/commands/Installation.js) class.

To run this command, use:

```sh
node index.js install
```

### Future Command Structure
In the future, the command structure will look something like this:

```sh
node rudder <arg>
```