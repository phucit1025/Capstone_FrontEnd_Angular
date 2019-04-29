import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GLOBAL} from '../global';

@Injectable({
  providedIn: 'root'
})
export class PostopStatisticalService {

  constructor(private http: HttpClient) {
  }

  getPostOpSurgeryShift(url) {
    return this.http.get(GLOBAL.API + 'PostOp/GetPostOpSurgeryShift' + url);
  }

  getDoctors(url) {
    return this.http.get(GLOBAL.API + 'PostOp/GetDoctors' + url);
  }

  getSpecialties(url) {
    return this.http.get(GLOBAL.API + 'PostOp/GetSpecialties' + url);
  }

  getCatalogs(url) {
    return this.http.get(GLOBAL.API + 'PostOp/GetCatalogs' + url);
  }
}
