import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GLOBAL} from '../global';

@Injectable({
  providedIn: 'root'
})

export class ImportService {
  private name = 'Import';

  constructor(private http: HttpClient) {
  }

  importShift(data) {
    return this.http.post(GLOBAL.API + this.name + '/ImportSurgeryShift', data);
  }

  importShiftMedicalSupply(data) {
    return this.http.post(GLOBAL.API + this.name + '/ImportSurgeryShiftMedicalSupply', data);
  }
}
