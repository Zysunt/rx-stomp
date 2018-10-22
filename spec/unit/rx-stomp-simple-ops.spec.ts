/* tslint:disable:no-unused-variable */

import 'jasmine';

import { filter } from 'rxjs/operators';

import { Message, StompHeaders } from '@stomp/stompjs';

import { RxStomp, StompState } from '../../src';

import { generateBinaryData } from '../helpers/content-helpers';
import { disconnetStompRAndEnsure, ensureStompConnected } from '../helpers/helpers';
import { rxStompFactory } from '../helpers/rx-stomp-factory';

describe('RxStomp', () => {
  let rxStomp: RxStomp;

  // Wait till RxStomp is actually connected
  beforeEach(() => {
    rxStomp = rxStompFactory();
  });

  // Disconnect and wait till it actually disconnects
  afterEach((done) => {
    disconnetStompRAndEnsure(rxStomp, done);
    rxStomp = null;
  });

  describe('Simple operations', () => {
    // Wait till RxStomp is actually connected
    beforeEach((done) => {
      ensureStompConnected(rxStomp, done);
    });

    it('should already be connected', () => {
      expect(rxStomp.connected()).toBe(true);
    });

    it('send and receive a message', (done) => {

      const queueName = '/topic/ng-demo-sub';
      const msg = 'My very special message';

      // Subscribe and set up the Observable
      rxStomp.subscribe(queueName).subscribe((message: Message) => {
        expect(message.body).toBe(msg);
        done();
      });

      // Now publish to the same queue
      rxStomp.publish({destination: queueName, body: msg});
    });

    it('send and receive a binary message', (done) => {

      const queueName = '/topic/ng-demo-sub';
      const binaryMsg = generateBinaryData(1);

      // Subscribe and set up the Observable
      rxStomp.subscribe(queueName).subscribe((message: Message) => {
        expect(message.binaryBody.toString()).toBe(binaryMsg.toString());
        done();
      });

      // Now publish to the same queue
      rxStomp.publish({destination: queueName, binaryBody: binaryMsg});
    });
  });

  describe('Common Operations', () => {
    it('should be able to subscribe even before STOMP is connected', (done) => {
      const queueName = '/topic/ng-demo-sub01';
      const msg = 'My very special message 01';

      // Subscribe and set up the Observable, the underlying STOMP may not have been connected
      rxStomp.subscribe(queueName).subscribe((message: Message) => {
        expect(message.body).toBe(msg);
        done();
      });

      rxStomp.connected$.subscribe((state: StompState) => {
        // Now publish the message when STOMP Broker is connected
        rxStomp.publish({destination: queueName, body: msg});
      });
    });

    it('should be able to publish/subscribe even before STOMP is connected', (done) => {
      // Queue is a durable queue
      const queueName = '/queue/ng-demo-sub02';
      const msg = 'My very special message 02' + Math.random();

      // Subscribe and set up the Observable, the underlying STOMP may not have been connected
      rxStomp.subscribe(queueName).pipe(
        filter((message: Message) => {
          // Since the queue is durable, we may receive older messages as well, discard those
          return message.body === msg;
        })
      ).subscribe((message: Message) => {
        expect(message.body).toBe(msg);
        done();
      });

      rxStomp.publish({destination: queueName, body: msg});
    });

    it('should be able to publish/subscribe when STOMP is disconnected', (done) => {
      // Queue is a durable queue
      const queueName = '/queue/ng-demo-sub02';
      const msg = 'My very special message 03' + Math.random();

      let firstTime = true;

      // Subscribe and set up the Observable, the underlying STOMP may not have been connected
      rxStomp.subscribe(queueName).pipe(
        filter((message: Message) => {
          // Since the queue is durable, we may receive older messages as well, discard those
          return message.body === msg;
        })
      ).subscribe((message: Message) => {
        expect(message.body).toBe(msg);
        done();
      });

      // Actively disconnect simulating error after STOMP connects, then publish the message
      rxStomp.connected$.subscribe((state: StompState) => {
        if (firstTime) {
          firstTime = false;

          rxStomp.stompClient.forceDisconnect();

          setTimeout(() => {
            // Now publish the message when STOMP Broker has been disconnected
            rxStomp.publish({destination: queueName, body: msg});
          }, 500);
        }
      });
    });

    it('should receive server headers', (done) => {
      rxStomp.serverHeaders$
        .subscribe((headers: StompHeaders) => {
          // Check that we have received at least one key in header
          expect(Object.keys(headers).length).toBeGreaterThan(0);

          // Subscribe again, we should get the same set of headers
          // (as per specifications, if STOMP has already connected it should immediately trigger)
          rxStomp.serverHeaders$
            .subscribe((headers1: StompHeaders) => {
              expect(headers1).toEqual(headers);
              done();
            });
        });
    });
  });
});
