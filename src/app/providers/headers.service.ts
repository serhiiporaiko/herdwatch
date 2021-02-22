import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeadersService {

  constructor() { }
  createAnonymousJSONOptions() {
    const headers: HttpHeaders = this.createHeaders('application/json');
    return { headers };
  }

  createHeaders(type: string): HttpHeaders {
    return new HttpHeaders().set('Content-Type', type);
  }
}
