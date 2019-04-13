import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GLOBAL} from '../global';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})

export class ScheduleService {
  private name = 'Schedule';

  constructor(private http: HttpClient) {
  }

  getSpecialtyByRoomId(roomId) {
    return this.http.get(GLOBAL.API + this.name + `/GetSpecialtyByRoomId?roomId=${roomId}`);
  }

  getSlotRooms() {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryRooms');
  }

  getReportByRoom(id, date) {
    return this.http.get(GLOBAL.API + this.name + '/GetReportByRoom?roomId=' + id + '&dayNumber=' + date);
  }

  getSurgeryShiftsByRoomAndDate(slotRoomId, dayNumber) {
    return this.http.get(GLOBAL.API + this.name + '/GetSurgeryShiftsByRoomAndDate',
      {
        params: {slotRoomId: slotRoomId, dayNumber: dayNumber}
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

  checkStatusPreviousSurgeryShift(shiftId) {
    return this.http.get(GLOBAL.API + this.name + `/CheckStatusPreviousSurgeryShift?shiftId=${shiftId}`);
  }

  deleteTreatmentReport(id) {
    return this.http.get(GLOBAL.API + 'PostOp/SoftDeleteTreatmentReport?id=' + id);
  }

  editTreatmentReport(data) {
    return this.http.post(GLOBAL.API + 'PostOp/EditTreatmentReport', data);
  }

  getHealthcareReport(id) {
    return this.http.get(GLOBAL.API + 'PostOp/GetHealthCareReportBySurgeryShiftId?surgeryShiftId=' + id);
  }

  exportSurgery(id, type){
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    return this.http.get(GLOBAL.API + `PostOp/CreateSurgeryPdf?id=${id}&type=${type}`,{ headers: headers, responseType: 'blob' })
    .subscribe((response) => this.downloadFile(response));
  }


  /**
   * Method is use to download file.
   * @param data - Array Buffer data
   * @param type - type of the document.
   */
  downloadFile(data: any) {
    var blob = new Blob([data], {type: 'application/pdf'});
    FileSaver.saveAs(blob, 'SurgeryExport');
  }

  searchDrug(value) {
    return this.http.get<Array<{ id: number; name: string; unit: string }>>(GLOBAL.API + `Drug/SearchDrugOnQuery?q=${value}`);
  }

  searchSupply(value) {
    return this.http.get<Array<{ medicalSupplyId: number; medicalSupplyName: string }>>(GLOBAL.API + `Utils/GetMedicalSupplyOnQuery?q=${value}`);
  }
}
