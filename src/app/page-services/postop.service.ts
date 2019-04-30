import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from '../global';


@Injectable({
  providedIn: 'root'
})
export class PostopService {
  private name = 'PostOp';

  constructor(private http: HttpClient) {
  }

  getHealthcareSurgeryShift() {
    return this.http.get(GLOBAL.API + this.name + '/GetHealthcareSurgeryShift');
  }
}
