type TimestampsKv = {
  created: string,
  updated: string,
  accessed: string
};
class Timestamps {
  static fromKv(value: TimestampsKv): Timestamps{
    const timestamps = new Timestamps();
    timestamps.created = new Date(value.created);
    timestamps.updated = new Date(value.updated);
    timestamps.accessed = new Date(value.accessed);
    return timestamps;
  }
  #created: Date; // TODO ensure that created <= updated <= accessed
  #updated: Date;
  #accessed: Date;

  constructor() {
    const now = new Date();
    this.#created = now;
    this.#updated = now;
    this.#accessed = now;
  }

  set created(date:Date){this.#created = date}
  set updated(date:Date){this.#updated = date}
  set accessed(date:Date){this.#accessed = date}
  get created():Date {return this.#created}
  get updated():Date {return this.#updated}
  get accessed():Date {return this.#accessed}

  access(){
    this.#accessed = new Date();
  }

  update(){
    const date = new Date();
    this.#updated = date;
    this.#accessed = date;
  }

  toKv():TimestampsKv {
    return {
      created: this.#created.toISOString(),
      updated: this.#updated.toISOString(),
      accessed: this.#accessed.toISOString(),
    };
  }

}

export type {TimestampsKv};
export {Timestamps};
