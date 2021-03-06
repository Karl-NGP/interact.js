import { Scope } from '@interactjs/core/scope';
import { merge } from '@interactjs/utils/arr';
import extend from '@interactjs/utils/extend';
import * as is from '@interactjs/utils/is';

declare module '@interactjs/core/Interactable' {
  interface Interactable {
    pointerEvents: typeof pointerEventsMethod
    __backCompatOption: (string, any) => any
  }
}

function install (scope: Scope) {
  const {
    pointerEvents,
    actions,
    Interactable,
    interactables,
  } = scope;

  pointerEvents.signals.on('collect-targets', function ({ targets, element, type, eventTarget }) {
    scope.interactables.forEachMatch(element, interactable => {
      const eventable = interactable.events;
      const options = eventable.options;

      if (
        eventable.types[type] &&
        eventable.types[type].length &&
        is.element(element) &&
        interactable.testIgnoreAllow(options, element, eventTarget)) {

        targets.push({
          element,
          eventable,
          props: { interactable },
        });
      }
    });
  });

  interactables.signals.on('new', function ({ interactable }) {
    interactable.events.getRect = function (element) {
      return interactable.getRect(element);
    };
  });

  interactables.signals.on('set', function ({ interactable, options }) {
    extend(interactable.events.options, pointerEvents.defaults);
    extend(interactable.events.options, options.pointerEvents || {});
  });

  merge(actions.eventTypes, pointerEvents.types);

  Interactable.prototype.pointerEvents = pointerEventsMethod;

  const __backCompatOption = Interactable.prototype._backCompatOption;

  Interactable.prototype._backCompatOption = function (optionName, newValue) {
    const ret = __backCompatOption.call(this, optionName, newValue);

    if (ret === this) {
      this.events.options[optionName] = newValue;
    }

    return ret;
  }
}

function pointerEventsMethod (options) {
  extend(this.events.options, options);

  return this;
}

export default {
  install,
};
