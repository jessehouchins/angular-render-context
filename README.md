# angular-render-context

Aangular Render Context is a simple Angular.js module for managing nested views, routing,
and rendering. The module works with `ngRoute` to provide a simple way to bind templates
(or anything else) to contextual routing changes. This allows each module within your
application to be responsible for it's own data and rendering, and only the relevant parts
of your layout will update when the route changes.

The built in `ng-view` directive, while convenient, is limited and forces each route to have a single template/controller (and fully rerender) on routing events. The very popular [Angular UI Router](http://angular-ui.github.io/ui-router/) is often used for more complex application. I found it kind of heavy to be honest, but it has great community support. You should probably check it out.

---------------------------

### Instalation

Require `'renderContext'` as an app dependency and include `angular-render-context.js` in your layout or main JS package.


### How it Works

The render context module watches for the `$routeChangeSuccess` event within your application and updates a public render context object. You can write template logic, or create your own watchers on this global object to respond to changes however you like.

### Routing

Routing with render context is very simple. Just define a context param for each of your routes. Your template and controller logic will handle everything else.

```javascript
    .when('/users', { context: 'app.users.list' })
    .when('/users/:userId', { context: 'app.users.dashboard' })
    .when('/users/:userId/messages', { context: 'app.users.messages' })
    .when('/users/:userId/messages/:messageId', { context: 'app.users.messages.preview' })
    .when('/users/:userId/account', { context: 'app.users.account' })
    .when('/groups', { context: 'app.groups.list' })
    .otherwise({ context: 'error.404' })
```

### The `renderContext` Object

With each route change, the render context object is updated to contain properties representing the current context relationship. This object is available on every scope and can be pulled into other modules by injecting `renderContext`. You can check for a full or partial context paths as shown below. There are also special context properties and methods available.

- `renderContext.layout` -- the base context
- `someContext.next` -- the name of the next context
- `someContext.prev` -- the name of the previous context
- `contextA.after.contextB` -- test the context order
- `contextA.before.contextB` -- test the context order
- `contextA.contextB` -- test specific parent/child context relationship

**Given a route context of `'app.users.messages.preview'`:**

```javascript
    renderContext.context                      // 'app.users.messages.preview'
    renderContext.layout                       // 'app'
    renderContext.app                          // truthy
    renderContext.users.messages               // truthy
    renderContext.messages.preview             // truthy
    renderContext.users.preview                // falsy
    renderContext.users.next === 'account'     // false
    renderContext.preview.prev === 'messages'  // true
    renderContext.preview.after.users          // truthy
    renderContext.users.before.preview         // truthy
```

You can write conditional logic using properties of this global object inside your templates, like this:

```html
    <html ng-app>
      <nav ng-if="renderContext.app">
        <a href="/users" ng-class="{active: renderContext.users}">
        <a href="/groups" ng-class="{active: renderContext.groups}">
      </nav>
      <section ng-if="renderContext.users" users-directive></section>
      <section ng-if="renderContext.groups" groups-directive></section>
      <section ng-if="renderContext.error" ng-include="'errors/404.html'"></section>
    </html>
```

```html
    <users-directive>
      <section ng-if="renderContext.dashboard" user-dashboard user="selectedUser"></section>
      <section ng-if="renderContext.messages" user-messages user="selectedUser"></section>
      <section ng-if="renderContext.account" user-account user="selectedUser"></section>
    </users-directive>
```

```html
    <user-messages-directive>
      <section message-list messages="users.messages"></section>
      <section ng-if="renderContext.preview" message-preview></section>
    </user-messages-directive>
```

You can also inject renderContext into controllers, or other modules:

```
    controller: function($scope, renderContext) {
      if (renderContext.users) {
        // do something here.
      }
    }
```

### `renderContext.get(context)`

Getting nested properties on the render context object is easy enough from a template. However, with object syntax, you would need to check individual properties in the chain to avoid undefined object errors. The `get` method provides a simple interface for checling nested properties.

```
    controller: function($scope, renderContext) {
      var isMessagePreview = renderContext.get('users.messages.preview')
    }
```

### `renderContext.goto(context, contextParams, replace)`

This is available as a method and a directive that can be used for navigaton. The complimentary `context-parmas` directive allows you to pass data required to evaluate the route's URL. If you do not pass a required param, **the module will try to find the value in the existing $routeParams hash**. If a required param is not found, it will throw an error. Setting replace to `true` will not ada history record when navigating.

When the directive is applied to an anchor element, it also updates the `href` attribute (with the first matching route url) so the link can be bookmarked or opened in a new tab.

Example directive:

```
    <a goto-context="users.dashboard" context-params="{userId: user.id}" replace-context>User Dashboard</a>
```

Note: you can also use interpolation within the `goto-context` like this:

```
    <a goto-context="{{section}}.list">Close Detail View</a>
```

Example from a controller/module:

```
    controller: function($scope, renderContext) {
      $scope.gotoDashboard = function() {
        renderContext.goto('users.dashboard', {userId: $scope.user.id})
      }
    }
```

### `renderContext.backto(context, replace)`

This method will navigate back to a higher level in the current context. For example, if the current context is `app.users.messages.preview`, calling `renderContext.backto('users')` will set the context to `app.users`.

Example directive:

```
    <a backto-context="users">Back to Users</a>
```

Example from a controller/module:

```
    controller: function($scope, renderContext) {
      $scope.goBack = function() {
        renderContext.backto('users')
      }
    }
```

