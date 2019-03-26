import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  addEmergencyShift(data) {
    return this.http.post(GLOBAL.API + this.name + '/AddEmergencyShift', data);
  }

  changeShiftStatus(data) {
    return this.http.post(GLOBAL.API + this.name + 'ChangeShiftStatus', data);
  }

  setIntraoperativeStatus(data) {
    return this.http.post(GLOBAL.API +
      `Status/SetIntraoperativeStatus?shiftId=${data.shiftId}&actualStartDateTime=${data.time}`, {});
  }

  setPostoperativeStatus(url) {
    return this.http.post(GLOBAL.API + 'Status/SetPostoperativeStatus' + url, {});
  }

  setFinishedStatus(url) {
    return this.http.post(GLOBAL.API + 'Status/SetFinishedStatus' + url, {});
  }

  refreshSurgeryShift(id) {
    return this.http.post(GLOBAL.API + this.name + `/RefreshSurgeryShift?shiftId=${id}`, {});
  }

  deleteTreatmentReport(id) {
    return this.http.get(GLOBAL.API + 'PostOp/SoftDeleteTreatmentReport?id=' + id);
  }

  editTreatmentReport(data) {
    return this.http.post(GLOBAL.API + 'PostOp/EditTreatmentReport', data);
  }

  getHealthcareReport(id){
    return this.http.get(GLOBAL.API + 'PostOp/GetHealthCareReportBySurgeryShiftId?surgeryShiftId=' + id);
  }

  exportSurgery(id){
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    return this.http.get(GLOBAL.API + 'PostOp/CreateSurgeryPdf?id=' + id,{ headers: headers, responseType: 'blob' })
    .subscribe((response) => this.downloadFile(response));
  }


  /**
  * Method is use to download file.
  * @param data - Array Buffer data
  * @param type - type of the document.
  */
  downloadFile(data: any) {
    var blob = new Blob([data], { type: "application/pdf" } );
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url);
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert( 'Please disable your Pop-up blocker and try again.');
    }
  }
}
