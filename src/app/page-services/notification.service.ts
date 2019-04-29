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
  getTmpNotification(roleName, technicalId) {
    return this.http.get(GLOBAL.API + this.name + `/GetAllNotification?roleName=${roleName}&technicalId=${technicalId}`);
  }

  getNotification(roleName, technicalId) {
    return this.http.get(GLOBAL.API + this.name + `/GetNotifications?roleName=${roleName}&technicalId=${technicalId}`);
  }

  setIsReadNotification(notiId) {
    return this.http.post(GLOBAL.API + this.name + `/SetIsReadNotification?notiId=${notiId}`, {});
  }
}