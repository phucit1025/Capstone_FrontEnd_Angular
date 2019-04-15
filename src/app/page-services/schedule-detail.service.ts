import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from '../global';

@Injectable({
  providedIn: 'root'
})
export class ScheduleDetailService {
  private name = 'SurgeryShift';

  constructor(private http: HttpClient) {
  }

  updateSurgeryProfile(data) {
    return this.http.post(GLOBAL.API + this.name + '/UpdateSurgeryProfile', data);
  }

  loadEditSurgeryProfile(shiftId) {
    return this.http.get(GLOBAL.API + this.name + `/LoadEditSurgeryProfile?shiftId=${shiftId}`);
  }

  searchSurgeryCatalog(searchName) {
    return this.http.get(GLOBAL.API + this.name + `/GetSurgeryCatalogOnQuery?searchName=${searchName}`);
  }

  checkExistedPatient(identityNumber) {
    return this.http.get(GLOBAL.API + `Utils/CheckExistedPatient?identityNumber=${identityNumber}`);
  }
}