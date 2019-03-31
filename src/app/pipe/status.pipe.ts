import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'statusPipe'
})
export class StatusPipe implements PipeTransform {

  transform(array: any, status: any[]): any {
    if (status && status.length > 0) {
      const newData = JSON.parse(JSON.stringify(array));
      array.map((el, i) => {
        el.slotRooms.forEach((slot, k) => {
          if (newData[i]) {
            newData[i].slotRooms[k].surgeries = [];
            status.forEach(st => {
              newData[i].slotRooms[k].surgeries = newData[i].slotRooms[k].surgeries
                .concat(slot.surgeries.filter(sg => sg.statusName.trim().toLowerCase() === st.trim().toLowerCase()));
              console.log();
            });
          }
        });
      });
      const finalSearch = newData.map(room => {
        room.slotRooms = room.slotRooms.filter(slot => slot.surgeries.length > 0);
        return room;
      }).filter(room => room.slotRooms.length > 0);
      return finalSearch.length > 0 ? finalSearch : [-1];
    }
    return array;
  }
}
