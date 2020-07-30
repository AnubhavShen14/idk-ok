"use strict";

exports.commands = {
	rf: "roomfounder",
	roomfounder: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.errorReply("/roomfounder - This room isn't designed for per-room moderation to be added");
		}
		if (!target) return this.parse("/help roomfounder");
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		let userid = toId(name);

		if (!Users.isUsernameKnown(userid)) {
			return this.errorReply(`User "${this.targetUsername}" is offline and unrecognized, and so can't be promoted.`);
		}

		if (!this.can("makeroom")) return false;

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		room.auth[userid] = "#";
		room.chatRoomData.founder = userid;
		room.founder = userid;
		this.addModAction(`${name} was appointed Room Founder by ${user.name}.`);
		if (targetUser) {
			targetUser.popup(`|html|You were appointed Room Founder by ${Server.nameColor(user.name, true)} in ${room.title}.`);
			room.onUpdateIdentity(targetUser);
		}
		Rooms.global.writeChatRoomData();
		room.protect = true;
	},
	roomfounderhelp: ["/roomfounder [username] - Appoints [username] as a room founder. Requires: & ~"],

	deroomfounder: "roomdefounder",
	roomdefounder: function (target, room) {
		if (!room.chatRoomData) {
			return this.errorReply("/roomdefounder - This room isn't designed for per-room moderation.");
		}
		if (!target) return this.parse("/help roomdefounder");
		if (!this.can("makeroom")) return false;
		let targetUser = toId(target);
		if (room.founder !== targetUser) return this.errorReply(`${target} is not the room founder of ${room.title}.`);
		room.founder = false;
		room.chatRoomData.founder = false;
		return this.parse(`/roomdeauth ${target}`);
	},
	roomdefounderhelp: ["/roomdefounder [username] - Revoke [username]'s room founder position. Requires: &, ~"],

	roomdeowner: "deroomowner",
	deroomowner: function (target, room, user) {
		if (!room.auth) {
			return this.errorReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		let userid = toId(name);
		if (!userid || userid === "") return this.errorReply(`User "${name}" does not exist.`);

		if (room.auth[userid] !== "#") return this.errorReply(`User "${name}" is not a room owner.`);
		if (!room.founder || user.userid !== room.founder && !this.can("makeroom", null, room)) return false;

		delete room.auth[userid];
		this.sendReply(`(${name} is no longer Room Owner.)`);
		if (targetUser) {
			targetUser.popup(`|html|You were demoted from Room Owner by ${Server.nameColor(user.name, true, true)} in ${room.title}.`);
			room.onUpdateIdentity(targetUser);
		}
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	roomdeownerhelp: ["/roomdeowner [username] - Demotes [username] from Room Owner. Requires: Room Founder, &, ~"],

	roomoperator: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.errorReply("/roomoperator - This room isn't designed for per-room moderation to be added");
		}
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;

		if (!targetUser) return this.errorReply(`User "${this.targetUsername}" is not online.`);

		if (!room.founder) return this.errorReply("The room needs a Room Founder before it can have a Room Operator.");
		if (room.founder !== user.userid && !this.can("makeroom")) return this.errorReply("/roomoperator - Access denied.");

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		let name = targetUser.name;

		if (targetUser) {
			targetUser.popup(`|html|You were appointed Room Operator by ${Server.nameColor(user.name, true, true)} in ${room.title}.`);
			room.onUpdateIdentity(targetUser);
		}
		room.auth[targetUser.userid] = "$";
		this.addModAction(`${name} was appointed Room Operator by ${user.name}.`);
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},
	roomoperatorhelp: ["/roomoperator [username] - Appoints [username] as a Room Operator. Requires: Room Founder, &, ~"],

	roomdeoperator: "deroomoperator",
	deroomoperator: function (target, room, user) {
		if (!room.auth) {
			return this.errorReply("/roomdeoperator - This room isn't designed for per-room moderation");
		}
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		let userid = toId(name);
		if (!userid || userid === "") return this.errorReply(`User "${name}" does not exist.`);

		if (room.auth[userid] !== "$") return this.errorReply(`User "${name}" is not a room operator.`);
		if (!room.founder || user.userid !== room.founder && !this.can("makeroom", null, room)) return false;

		if (targetUser) {
			targetUser.popup(`|html|You were demoted from Room Operator by ${Server.nameColor(user.name, true)} in ${room.title}.`);
			room.onUpdateIdentity(targetUser);
		}
		delete room.auth[userid];
		this.sendReply(`(${name} is no longer Room Operator.)`);
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	roomdeoperatorhelp: ["/roomdeoperator [username] - Demotes [username] from Room Operator. Requires: Room Founder, &, ~"],
};
