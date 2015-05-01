# angular-render-context

A surprisingly simple Angular.js module for managing nested views, routing, and rendering.

---------------------------

### Instalation

Require `'renderContext'` as an app dependency and include `angular-render-context.js` in your layout or main JS package.


### Why?

The built in `ng-view` directive is a convenient way to provide unique content for routes within
your application. However, it forces each route to have a single template/controller (and fully rerender)
on routing events.

[Angular UI Router](http://angular-ui.github.io/ui-router/) is another popular routing module for complex applications. Be sure to check it out. I find it kinda heavy to be honest, but it has great community support.

The `render-context` directive works differently. It works with `ngRoute` to provide a simple way to bind templates
(or anything with access to `$scope`) to contextual routing changes. This means
each nested context within your application can be responsible for it's own data and rendering, and
only the relevant parts of your layout will update when the route changes.


### What It Does

The render context module watches for the `$routeChangeSuccess` event within your application and updates the public render context object. This object is available on every scope and can be pulled into other modules by injecting `renderContext`. You can write template logic, or create your own watchers on this global object to respond to changes however you like.


### How to Use It

With each route change, the render context object is updated to contain properties representing the current context relationship. You can check for a full or partial context paths as shown below. There are also special context properties available.

- `renderContext.layout` -- the base context
- `someContext.next` -- the name of the next context
- `someContext.prev` -- the name of the previous context
- `contextA.after.contextB` -- test the context order
- `contextA.before.contextB` -- test the context order
- `contextA.contextB` -- test specifc parent/child context relationship

**Given a route action of `'app.user.messages.preview'`:**

```javascript
    renderContext.layout === 'app'             // true
    renderContext.app                          // truthy
    renderContext.user.messages                // truthy
    renderContext.messages.preview             // truthy
    renderContext.users.preview                // falsy
    renderContext.users.next === 'account'     // false
    renderContext.preview.prev === 'messages'  // true
    renderContext.preview.after.users          // truthy
    renderContext.users.before.preview         // truthy
```


### Route Setup

```javascript
    .when('/users', { action: 'app.users.list' })
    .when('/users/:userId', { action: 'app.users.dashboard' })
    .when('/users/:userId/messages', { action: 'app.users.messages' })
    .when('/users/:userId/messages/:messageId', { action: 'app.users.messages.preview' })
    .when('/users/:userId/account', { action: 'app.users.account' })
    .when('/groups', { action: 'app.groups.list' })
    .otherwise({ action: 'error.404' })
```


### Template Samples

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
      <section message-list messages="user.messages"></section>
      <section ng-if="renderContext.preview" message-preview></section>
    </user-messages-directive>
```
