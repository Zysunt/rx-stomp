import { StompHeaders } from '@stomp/stompjs';
/**
 * Represents a configuration object for the
 * RxSTOMP.
 */

export class RxStompConfig {
  /**
   * Server URL to connect to. Please refer to your STOMP broker documentation for details.
   *
   * Example: ws://127.0.0.1:15674/ws (for a RabbitMQ default setup running on localhost)
   *
   * Alternatively this parameter can be a function that returns an object similar to WebSocket
   * (typically SockJS instance).
   *
   * Example:
   *
   * () => {
   *   return new SockJS('http://127.0.0.1:15674/stomp');
   * }
   */
  public url: string | (() => any);

  /**
   * Headers
   * Typical keys: login: string, passcode: string.
   * host:string will needed to be passed for virtual hosts in RabbitMQ
   */
  public headers: StompHeaders;

  /** How often to incoming heartbeat?
   * Interval in milliseconds, set to 0 to disable
   *
   * Typical value 0 - disabled
   */
  public heartbeatIncoming: number;

  /**
   * How often to outgoing heartbeat?
   * Interval in milliseconds, set to 0 to disable
   *
   * Typical value 20000 - every 20 seconds
   */
  public heartbeatOutgoing: number;

  /**
   * Wait in milliseconds before attempting auto reconnect
   * Set to 0 to disable
   *
   * Typical value 5000 (5 seconds)
   */
  public reconnectDelay: number;

  /** Enable client debugging? */
  public debug: boolean;
}
