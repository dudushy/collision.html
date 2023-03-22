/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  title = 'DbService';

  constructor() {
    console.log(`[${this.title}#constructor]`);

    this.setupDb();
  }

  setupDb() {
    console.log(`[${this.title}#setupDb]`);
  }

  get(varname: any) {
    return JSON.parse(localStorage.getItem(varname) || 'null');
  }

  set(varname: any, value: any) {
    localStorage.setItem(varname, JSON.stringify(value));
  }
}
