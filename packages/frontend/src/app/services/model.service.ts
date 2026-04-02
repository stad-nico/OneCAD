import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FrontendEvent, FrontendEventMessage, Model } from '@opentscad/types';
import { filter, map, Observable, scan } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class ModelService {
  private readonly socket: Socket = io('ws://localhost:3000/frontend', {
    transports: ['websocket'],
  });

  private readonly socket$ = new Observable<FrontendEventMessage>((subscriber) => {
    this.socket.on('connect', () => console.log('Socket.io connected'));
    this.socket.on(FrontendEvent.ModelUpdate, (message: FrontendEventMessage) => {
      subscriber.next(message);
    });
    return () => this.socket.disconnect();
  });

  public readonly models = toSignal(
    this.socket$.pipe(
      filter((message) => message.event === FrontendEvent.ModelUpdate),
      map(({ model }) => model),
      scan(
        (acc, model) => (acc.some((m) => m.id === model.id) ? acc : [...acc, model]),
        [] as Array<Model>,
      ),
    ),
    { initialValue: [] as Array<Model> },
  );

  constructor() {
    this.socket$.subscribe((q) => console.log(q));
  }
}
