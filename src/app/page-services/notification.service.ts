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
  getNotification() {
    return this.http.get(GLOBAL.API + this.name + '/GetAllNotification');
  }
}