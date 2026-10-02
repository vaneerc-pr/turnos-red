import type { Server as ServidorHttp } from "node:http";
import { Server } from "socket.io";
import { busEventos } from "../events/busEventos.js";

export function iniciarTiempoReal(servidorHttp: ServidorHttp): Server {
  const io = new Server(servidorHttp);

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  busEventos.on("turno:creado", (turno) => io.emit("turno:nuevo", turno));
  busEventos.on("turno:actualizado", (turno) =>
    io.emit("turno:actualizado", turno),
  );
  busEventos.on("turno:eliminado", (turno) =>
    io.emit("turno:eliminado", turno),
  );

  return io;
}
