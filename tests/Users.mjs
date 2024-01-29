import { useUsers, UserRecord } from '../server/vingrecord/records/User.mjs';


function getAllMethods(object) {
    return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] == 'function';
    });
}

const Users = useUsers();

console.log(getAllMethods(Users));
console.log(Object.getOwnPropertyNames(Users));
