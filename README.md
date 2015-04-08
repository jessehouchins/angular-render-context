# angular-render-context

A surprisingly simple Angular.js directive for managing nested views, routing, and rendering.

---------------------------

### Instalation

Require `'j4'` as an app dependency and include `angular-render-context.js` in your layout or main JS package.


### Why?

The built in `ng-view` directive is a convenient way to provide unique content for routes within
your application. However, it forces each route to have a single template/controller (and fully rerender)
on routing events.

The `render-context` directive works differently. It provides a simple way to bind templates
(or anything with access to $scope) to contextual routing changes at a specified depth. This means
each nested context within your application can be responsible for it's own data and rendering, and
only the relevant parts of your layout will update when the route changes.


### Example Routes

```
    .when('/users/:userId', { action: 'app.user.dashboard' })
    .when('/users/:userId/messages', { action: 'app.user.messages' })
    .when('/users/:userId/account', { action: 'app.user.account' })
    .otherwise({ action: 'error.404' })
```


### Example Template

```
    <div render-context="next">
      <div ng-if="renderContext.is('dashboard')" user-dashboard user="user" />
      <div ng-if="renderContext.is('messages')" user-messages user="user" />
      <div ng-if="renderContext.is('account')" user-account user="user" />
    </div>
```


### Directive Options

  * `render-context="next"`     -- Set the render context to the next context (deeper).
  * `render-context="prev"`     -- Set the render context to the previous context (shallower).
  * `render-context`            -- Usefull to establish a render context from inside a directive with isolate scope.


### Methods

Methods are available on the $scope.renderContext object.

  * `.next()`           -- Returns the next context (deeper)
  * `.prev()`           -- Returns the previous context (shallower)
  * `.is('context')`    -- Return true if the contexts match
  * `.isNot('context')` -- Return true if the contexts do not match
  * `.isNotSet()`       -- Returns true if the context is falsy
