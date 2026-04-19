import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ObservableInput, switchMap } from 'rxjs';

/**
 * A utility function to create a derived signal from an existing signal by applying a projection function.
 *
 * @param value the source signal to derive from
 * @param project a function that takes the current value of the source signal and returns an observable
 * @param initialValue an optional initial value for the derived signal
 * @returns a new signal that emits the projected values
 */
export function rxSignal<TInput, TOutput>(
  value: Signal<TInput>,
  project: (value: TInput, index: number) => ObservableInput<TOutput>,
  initialValue?: NoInfer<TOutput>
): Signal<TOutput | undefined> {
  if (initialValue === undefined) {
    return toSignal(toObservable(value).pipe(switchMap(project)));
  }

  return toSignal(toObservable(value).pipe(switchMap(project)), { initialValue });
}
