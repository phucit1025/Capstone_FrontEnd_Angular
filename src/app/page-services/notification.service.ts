import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GLOBAL} from '../global';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private name = 'MessageNotification';

  constructor(private http: HttpClient) {
  }
  getTmpNotification(roleName) {
    return this.http.get(GLOBAL.API + this.name + '/GetAllNotification?roleName=' + roleName);
  }

  getNotification(roleName) {
    return this.http.get(GLOBAL.API + this.name + '/GetNotifications?roleName=' + roleName);
  }

  setIsReadNotification(roleName) {
    return this.http.post(GLOBAL.API + this.name + `/SetIsReadNotification?roleName=${roleName}`, {});
  }
}