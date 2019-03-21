import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../global';

@Injectable({
  providedIn: 'root'
})

export class ScheduleService {
  private name = 'Schedule';

  constructor(private http: HttpClient) {
  }

  getSlotRooms() {
    return this.http.get(GLOBAL.API + this.name + '/GetSlotRooms');
  }

  getSurgeryShiftsByRoomAndDate(slotRoomId, dayNumber) {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryShiftsByRoomAndDate',
      {
        params: { slotRoomId: slotRoomId, dayNumber: dayNumber }
      });
  }

  getGetAvailableRoom(data: {
    startDate, endDate
  }) {
    return this.http.post(GLOBAL.API + this.name + '/GetAvailableRoom', data);
  }

  getRoomInfo(id) {
    return this.http.get(GLOBAL.API + this.name + '/GetRoomInfo?id=' + id);
  }

  getAvailableRoomForDuration(data: {
    hour, minute
  }) {
    return this.http.post(GLOBAL.API + this.name + '/GetAvailableRoomForDuration', {
      params: {
        hour: data.hour,
        minute: data.minute
      }
    });
  }

  changeSchedule(data) {
    return this.http.post(GLOBAL.API + this.name + '/ChangeSchedule', data);
  }

  changeScheduleForDuration(data) {
    return this.http.post(GLOBAL.API + this.name + '/ChangeScheduleForDuration', data);
  }

  swapShift(data) {
    return this.http.post(GLOBAL.API + this.name + '/SwapShifts', data);
  }

  getDetailSchedule(id) {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryShiftDetail?shiftId=' + id);
  }

  moveRoom(data) {
    return this.http.post(GLOBAL.API + this.name + '/SwapShiftToRoom', data);
  }

  getUsedSupply(id) {
    return this.http.get(GLOBAL.API + this.name + '/GetUsedSupply?surgeryShiftId=' + id);
  }

  addUsedMedicalSupply(data) {
    return this.http.post(GLOBAL.API + this.name + '/AddUsedMedicalSupply', data);
  }

  getAllSupply() {
    return this.http.get(GLOBAL.API + 'Utils/GetMedicalSupplies');
  }

  getAllDrug() {
    return this.http.get(GLOBAL.API + 'Drug/GetAllDrugs');
  }

  saveSurgeryProcedure(data) {
    return this.http.post(GLOBAL.API + this.name + '/SaveSurgeryProcedure', data);
  }

  getEkipMember(id) {
    return this.http.get(GLOBAL.API + 'SurgeryShift/GetEkipMember?surgeryShiftId=' + id);
  }

  getTreatmentReport(id) {
    return this.http.get(GLOBAL.API + 'PostOp/GetTreatmentReportByShiftId?surgeryShiftId=' + id);
  }

  createTreatmentReport(data) {
    return this.http.post(GLOBAL.API + 'PostOp/CreateTreatmenReport', data);
  }

  getAllNurse() {
    return this.http.get(GLOBAL.API + 'PostOp/GetAllNurse');
  }

  getNurseByShiftId(id) {
    return this.http.get(GLOBAL.API + 'PostOp/GetNurseByShiftId?shiftId=' + id);
  }

  assignNurse(shiftId, nurseId) {
    return this.http.get(GLOBAL.API + 'PostOp/AssignNurse', {
      params: {
        shiftId: shiftId,
        nurseId: nurseId
      }
    });
  }

  getServerTime() {
    return this.http.get(GLOBAL.API + this.name + '/GetServerTime', {
      responseType: 'text'
    });
  }
}
