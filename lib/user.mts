import { PasswordDigest } from "./password-digest.mts";
import type { PasswordDigestKv } from "./password-digest.mts";
import { Timestamps } from "./timestamps.mts";
import type { TimestampsKv } from "./timestamps.mts";

import {
  // HashFunction, 
  digestText
} from './util/digest.mts';


type UserKv = {
  username: string,
  passwordDigest: PasswordDigestKv,
  timestamps: TimestampsKv,
};

class User {
  /**
   * Generated by Google Gemeini. Explanation:
   * ^: Matches the beginning of the string.
   * (?![_.]): Negative lookahead assertion to ensure the username doesn't start with an underscore or period.
   * (?!.*[_.]{2}): Negative lookahead assertion to prevent usernames with consecutive underscores or periods anywhere in the string.
   * [A-Za-z0-9._]{3,30}: Matches 3 to 30 characters consisting of alphanumeric characters (uppercase and lowercase letters, numbers 0-9), underscore (_), and period (.).
   */
  static usernameRegex = /^(?![_.])(?!.*[_.]{2})[A-Za-z0-9._]{3,30}$/;

  static fromKv(value: UserKv): User {
    const timestamps = Timestamps.fromKv(value.timestamps);
    timestamps.access();

    return new User(
      value.username,
      PasswordDigest.fromKv(value.passwordDigest),
      timestamps
    );
  }

  static async idFromUsername(username: string): Promise<string> {
    return await digestText(username);
  }

  #username: string;
  #passwordDigest: PasswordDigest;
  #timestamps: Timestamps;

  constructor(username: string, passwordDigest: PasswordDigest, timestamps: Timestamps = new Timestamps()) {
    if(!username.match(User.usernameRegex))throw new TypeError('not a username');
    this.#username = username;
    this.#passwordDigest = passwordDigest;
    this.#timestamps = timestamps;
  }

  get username():string {return this.#username;}
  get passwordDigest():PasswordDigest {return this.#passwordDigest;}
  get timestamps():Timestamps {return this.#timestamps;}
  set passwordDigest(newValue: PasswordDigest) {
    this.#passwordDigest = newValue;
    this.timestamps.update();
  }
  
  async getId(){
    return await digestText(this.#username);
  }

  async getUrn(){
    const id = await this.getId();
    return `urn:qworum:user:${id}`;
  }

  toKv(){
    return {
      username: this.#username,
      passwordDigest: this.#passwordDigest.toKv(),
      timestamps: this.#timestamps.toKv(),
    };
  }
}

export type {UserKv};
export {User};
