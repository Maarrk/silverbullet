Object decorators are an **advanced technique** that can be used to add attributes to [[Objects]] dynamically whose values are _calculated dynamically_ (on-the-fly) based on an [[Expression Language|expression]].

> **warning** Warning
> This feature is still experimental and may change in the (near) future.

The primary use case is [[Page Decorations]], but it is a powerful mechanism that probably has wider applications. As always, with great power comes great responsibility.

# Syntax
Object decorations are specified in [[^SETTINGS]] using the following syntax:

```yaml
objectDecorators:
- where: '<<filter expression>>'
  attributes:
     <<attributePath>>: '<<value expression>>'
```

**Note:** To make changes take effect you may have to reload your client (just refresh the page).

A few things of note:

* `<<filter expression>>` is a [[YAML]] string-encoded expression using SilverBullet’s [[Expression Language]]. Some examples:
  * `where: 'tags = "book"'` to make this apply to all objects that has `book` as one of its tags.
* `<<attributePath>>` can either be a simple attribute name, or a nested one using the `attribute.subAttribute` syntax. Some examples:
  * `fullName`
  * `pageDecoration.prefix`
* `<<value expression>>` like `<<expression>>` must be a YAML string-encoded expression using the [[Expression Language]], some examples together with the attribute path:
  * `alwaysTen: '10'` (attaches an attribute named `alwaysTen` with the numeric value `10` to all objects matching the `where` clause)
  * `fullName: 'firstName + " " + lastName'` (attaches a `fullName` attribute that concatenates the `firstName` and `lastName` attributes with a space in between)
  * `nameLength: 'count(name)'` (attaches an attribute `nameLength` with the string length of `name` — not particularly useful, but to demonstrate you can call [[Functions]] here too)
* For performance reasons, all expressions (both filter and value expressions) need to be _synchronously evaluatable_.
  * Generally, this means they need to be “simple expressions” that require no expensive calls.
  * Simple expressions include simple things like literals, arithmetic, calling some of the cheap [[Functions]] such as `today()` or string manipulation functions.
  * Expensive calls include any additional database queries, or any function call (custom or otherwise) that are _asynchronous_. These are _not supported_.
  * This requirement **will be checked at runtime**. Watch your server logs and browser’s JavaScript JavaScript console to see these errors. 

# Example
Let’s say that you use the `human` tag to track various humans in your space, as follows:

```#human
firstName: Steve
lastName: Bee
---
firstName: Stephanie
lastName: Bee
```

This would get you the follow data set:

```query
human select firstName, lastName
```

However, you would like to dynamically compute an additional attribute for all humans, namely `fullName`. This can be done as follows in your [[^SETTINGS]]:

```yaml
objectDecorators:
- where: 'tag = "human"'
  attributes:
     fullName: 'firstName + " " + lastName'
```

Which will give you the following:

```query
human select fullName, firstName, lastName
```

Tadaa!
