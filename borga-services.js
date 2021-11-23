'use strict';


module.exports = function (data_ext, data_int) {
        return {
                getPopularGames: data_int.getPopularGames,
                searchGameByName: data_ext.getGameByName,

                createNewUser: data_int.createNewUser,
                createGroup: data_int.createGroup,
                editGroup: data_int.editGroup,
                listUserGroups: data_int.listUserGroups,
                deleteGroup: data_int.deleteGroup,
                getGroupDetails: data_int.getGroupDetails,
                addGameToGroup: data_int.addGameToGroup,
                removeGameFromGroup: data_int.removeGameFromGroup,

                getGroup: data_int.getGroupFromUser
        };
}
