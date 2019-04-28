import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'roomPipe'
})
export class RoomPipe implements PipeTransform {

  transform(array: any, search: string): any {
    if (search && search.trim()) {
      const newData = JSON.parse(JSON.stringify(array));
      array.map((el, i) => {
        el.slotRooms.forEach((slot, k) => {
          if (newData[i]) {
            newData[i].slotRooms[k].surgeries = slot.surgeries.filter(sg => {
              const sgArr = [];
              if (sg) {
                // tslint:disable-next-line:forin
                if (sg.surgeonNames.filter(n => n.indexOf(search)).length > 0) {
                  return sg;
                }
                if (sg.patientName.indexOf(search) !== -1) {
                  return sg;
                }
                if (sg.catalogName.indexOf(search) !== -1) {
                  return sg;
                }
              }
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
