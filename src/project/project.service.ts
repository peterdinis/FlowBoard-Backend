import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; 
import { Prisma } from "@prisma/client";

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) { }

    async createProject(data: Prisma.ProjectCreateInput) {
        return this.prisma.project.create({ data });
    }

    async getProjectById(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async getAllProjects(
        search?: string,
        page: number = 1,
        pageSize: number = 10
    ) {
        const where: Prisma.ProjectWhereInput = search
            ? {
                OR: [
                    { name: { contains: search } },
                ],
            }
            : {};

        const projects = await this.prisma.project.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        });

        const totalCount = await this.prisma.project.count({ where });

        return {
            projects,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
            totalCount,
        };
    }

    async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
        const project = await this.prisma.project.findUnique({ where: { id } });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return this.prisma.project.update({
            where: { id },
            data,
        });
    }

    async deleteProject(id: string) {
        const project = await this.prisma.project.findUnique({ where: { id } });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return this.prisma.project.delete({ where: { id } });
    }
}