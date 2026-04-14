import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AstAssemblyNode, FrontendEvent, FrontendEventMessage, Logger } from '@opentscad/types';
import { filter, map, Observable, scan } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class ModelService {
  /**
   * The socket io client that connects to the backends frontend websocket namespace.
   */
  private readonly socket: Socket = io('ws://localhost:3000/frontend', {
    transports: ['websocket'],
  });

  /**
   * An observable that emits all messages received from the backend frontend socket.
   * We use this as the source for all our signals that need to react to backend events.
   */
  private readonly socket$ = new Observable<FrontendEventMessage>((subscriber) => {
    this.socket.on('connect', () => Logger.log('Successfully connected to backend socket'));
    this.socket.onAny((event: string, message: FrontendEventMessage) => subscriber.next(message));
    return () => this.socket.disconnect();
  });

  /**
   * Observable that emits the changed model when a
   * {@link FrontendEvent.ModelUpdate} message was recevied
   */
  public readonly modelChange$ = this.socket$.pipe(
    filter((message) => {
      const isAssemblyUpdate = message.event === FrontendEvent.AssemblyUpdate;
      if (isAssemblyUpdate) {
        Logger.debug('[ModelService] Assembly update received', { message });
      }
      return isAssemblyUpdate;
    }),
    map(({ payload }) => payload.assembly),
  );

  /**
   * A signal that holds the list of all models known to the frontend.
   * It updates whenever a new model update message is received from the backend.
   */
  public readonly models = toSignal(
    this.socket$.pipe(
      filter((message) => message.event === FrontendEvent.AssemblyUpdate),
      map(({ payload }) => payload.assembly),
      scan(
        (acc, assembly) =>
          acc.some((m) => m.id === assembly.id)
            ? acc.map((m) => (m.id === assembly.id ? assembly : m))
            : [...acc, assembly],
        [] as Array<AstAssemblyNode>,
      ),
    ),
    { initialValue: [] as Array<AstAssemblyNode> },
  );
}
