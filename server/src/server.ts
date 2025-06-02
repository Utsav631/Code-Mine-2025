import express, { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import { SocketEvent, SocketId } from "./types/socket"
import { USER_CONNECTION_STATUS, User } from "./types/user"
import { Server } from "socket.io"
import path from "path"
import UserModel from "./models/User";
 
 
  
interface UserSocket {
  socketId: string; 
  roomId: string;
  username: string; 
} 

let userSocketMap: UserSocket[] = [];

dotenv.config()

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static(path.join(__dirname, "public"))) // Serve static files


import connectDB from "./db";

connectDB(); // Call this before `server.listen()`


const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

// Async function to get users from MongoDB
async function getUsersInRoomFromDB(roomId: string): Promise<User[]> {
	return await UserModel.find({ roomId });
}

function getUsersInRoom(roomId: string): UserSocket[] {
  return userSocketMap.filter((user) => user.roomId === roomId);
}


// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId
	)?.roomId

	if (!roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return roomId
}

function getUserBySocketId(socketId: SocketId): UserSocket | null {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  if (!user) {
    console.error("User not found for socket ID:", socketId);
    return null;
  }
  return user;
}



io.on("connection", (socket) => {
	// Handle user actions
	socket.on(SocketEvent.JOIN_REQUEST, async ({ roomId, username }) => {
	// Check if username exists in the room
	const isUsernameExist = getUsersInRoom(roomId).filter(
		(u) => u.username === username
	)
	if (isUsernameExist.length > 0) {
		io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
		return
	}

	const user = {
		username,
		roomId,
		status: USER_CONNECTION_STATUS.ONLINE,
		cursorPosition: 0,
		typing: false,
		socketId: socket.id,
		currentFile: null,
	}

	// 🧩 Save to MongoDB
	try {
		await UserModel.create(user)
	} catch (err) {
		console.error("❌ Failed to save user to MongoDB:", err)
	}

	userSocketMap.push(user)
	socket.join(roomId)
	socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
	const users = getUsersInRoom(roomId)
	io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
	console.log("New User entered\n")
	console.log(user)
})


	socket.on("disconnecting", () => {
	const user = getUserBySocketId(socket.id);
	if (!user) return;

	const roomId = user.roomId;

	// Notify other clients in the room
	socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });

	// Remove the user from the internal map
	userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
});


	// Handle file actions
	socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
	io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
		fileStructure,
		openFiles,
		activeFile,
	});
});

// Directory operations
socket.on(SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
		parentDirId,
		newDirectory,
	});
});

socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
		dirId,
		children,
	});
});

socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
		dirId,
		newName,
	});
});

socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId });
});

// File operations
socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.FILE_CREATED, {
		parentDirId,
		newFile,
	});
});

socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
		fileId,
		newContent,
	});
});

socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
		fileId,
		newName,
	});
});

socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId });
});

// User status
socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
	userSocketMap = userSocketMap.map((user) =>
		user.socketId === socketId ? { ...user, status: USER_CONNECTION_STATUS.OFFLINE } : user
	);
	const roomId = getRoomId(socketId);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId });
});

socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
	userSocketMap = userSocketMap.map((user) =>
		user.socketId === socketId ? { ...user, status: USER_CONNECTION_STATUS.ONLINE } : user
	);
	const roomId = getRoomId(socketId);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId });
});

// Chat
socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
});

// Cursor / Typing
socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
	userSocketMap = userSocketMap.map((user) =>
		user.socketId === socket.id ? { ...user, typing: true, cursorPosition } : user
	);
	const user = getUserBySocketId(socket.id);
	if (!user) return;
	socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_START, { user });
});

socket.on(SocketEvent.TYPING_PAUSE, () => {
	userSocketMap = userSocketMap.map((user) =>
		user.socketId === socket.id ? { ...user, typing: false } : user
	);
	const user = getUserBySocketId(socket.id);
	if (!user) return;
	socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_PAUSE, { user });
});

// Drawing
socket.on(SocketEvent.REQUEST_DRAWING, () => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id });
});

socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
	socket.broadcast.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData });
});

socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
	const roomId = getRoomId(socket.id);
	if (!roomId) return;
	socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, { snapshot });
});

// Disconnecting
socket.on("disconnecting", () => {
	const user = getUserBySocketId(socket.id);
	if (!user) return;

	const roomId = user.roomId;

	socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });

	userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
});

})

const PORT = process.env.PORT || 3000

app.get("/", (req: Request, res: Response) => {
	// Send the index.html file
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
