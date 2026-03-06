import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma";
import { DatabaseResetService } from "./database-reset.service";

@Module({
  imports:[PrismaModule],
  providers:[DatabaseResetService],
  exports:[DatabaseResetService]
})
export class DatabaseResetModule{}