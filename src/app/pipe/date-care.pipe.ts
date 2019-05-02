import { Pipe, PipeTransform } from '@angular/core';
import { GLOBAL } from '../global';

@Pipe({
  name: 'dateCarePipe'
})
export class DateCarePipe implements PipeTransform {

  transform(array: any, date?: any): any {
    if(date){
      var dateString = GLOBAL.convertDate(date);
      console.log(dateString);
      console.log(array);
      return array.filter(s => {
        console.log(GLOBAL.convertDate(new Date(s.closestDate)));
        console.log(dateString);
        console.log(GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString));
        return GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString);
      });
    }
    return array;
  }

}
