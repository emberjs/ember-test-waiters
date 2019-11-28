const syntaxDecorators = require('@babel/plugin-syntax-decorators').default;

const source = 'ember-test-waiters';
const toStrip = ['waitForPromise', 'waitForCoroutine'];

function stripWrappers() {
  return {
    name: 'strip ember-test-waiters wrappers',
    inherits: syntaxDecorators,
    visitor: {
      Program(path) {
        toStrip.forEach(binding => {
          let b = path.scope.getBinding(binding);
          if (b && b.kind === 'module' && b.path.parentPath.node.source.value === source) {
            b.referencePaths.forEach(path => {
              if (path.parentPath.isCallExpression()) {
                path.parentPath.replaceWith(path.parentPath.node.arguments[0]);
              } else if (path.parentPath.isDecorator()) {
                let methodNode = path.parentPath.parentPath.node;
                path.parentPath.remove();

                // The legacy decorators transform plugin ignores empty
                // decorators arrays, but the class transform plugin blows up if
                // there is a decorators array, even if empty. So when removing
                // decorators we need to make sure to clean up empty decorators
                // arrays
                if (methodNode.decorators.length === 0) {
                  methodNode.decorators = null;
                }
              }
            });

            b.path.remove();
          }
        });

        let body = path.get('body');

        for (let i = 0; i < body.length; i++) {
          let decl = body[i];
          let specifiers = decl.node.specifiers;
          if (decl.node.source && decl.node.source.value === source) {
            if (specifiers.length === 0) {
              decl.remove();
            }
          }
        }
      },
    },
  };
}

stripWrappers.baseDir = function() {
  return __dirname;
};

module.exports = stripWrappers;
