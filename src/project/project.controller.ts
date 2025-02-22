import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Projects")
@Controller("project")

export class ProjectController {}