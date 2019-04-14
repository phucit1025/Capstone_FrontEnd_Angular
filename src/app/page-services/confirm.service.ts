import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../global';

@Injectable({
  providedIn: 'root'
})

export class ConfirmMedicalService {
  private name = 'MedicalConfirm';

  constructor(private http: HttpClient) {
  }

  getAll() {
    return this.http.get(GLOBAL.API + this.name + '/GetAllMedicalSupplyRequest');
  }

  confirmMedicalRequest(data) {
    return this.http.post(GLOBAL.API + this.name + '/ConfirmMedicalRequest', data);
  }

  makeScheduleList() {
    return this.http.get(GLOBAL.API + 'Schedule/MakeScheduleList');
  }

  notifyMessage() {
    return this.http.get(GLOBAL.API + 'MessageNotification/GetAllNotification');
  }

  assignEkip() {
    return this.http.get(GLOBAL.API + 'Schedule/AssignEkip');
  }

  assignTechnicalStaff(){
    return this.http.get(GLOBAL.API + 'Schedule/AssignTechnicalStaff');
  }
}
