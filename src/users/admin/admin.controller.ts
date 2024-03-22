import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { Admin } from "./admin.entity";
import { ILike, Like } from "typeorm";
import { EditAdminDTO } from "./dtos/edit-admin.dto";
import { CreateAdminDTO } from "./dtos/create-admin.dto";
import * as bcrypt from "bcryptjs"


@Controller('admin')
export class AdminController {
    @Get()
    async getAdmins(@Query() query: any) {
        let where: Record<any, any> = {};
        if (query['firstName.eq']) {
            where = { ...where, firstName: query['firstName.eq'] };
        }
        if (query['firstName.startWith']) {
            where = {
                ...where,
                firstName: ILike(`${query['firstName.startWith']}%`),
            };
        }
        if (query['lastName.eq']) {
            where = { ...where, lastName: query['lastName.eq'] };
        }
        if (query['lastName.startWith']) {
            where = { ...where, lastName: ILike(`${query['lastName.startWith']}%`) };
        }
        if (query['phone.eq']) {
            where = { ...where, phone: query['phone.eq'] };
        }
        if (query['phone.startWith']) {
            where = { ...where, phone: Like(`${query['phone.startWith']}%`) };
        }

        const limit = +(query['limit'] || 10);
        const page = +(query['page'] || 0) * limit;
        const content = await Admin.find({
            order: { id: -1 },
            skip: page,
            take: limit,
            where,
        })
        const count = await Admin.count()

        return { content, count }
    }

    @Get(':id')
    async getAdminById(@Param("id", ParseIntPipe) id: number) {
        const admin = await Admin.findOne({ where: { id } })
        if (!admin) {
            throw new NotFoundException("admin is not defined")
        }
        return admin;
    }

    @Post()
    async createAdmin(@Body() body: CreateAdminDTO) {
        const { password, phone, ...otherData } = body;
        const isDuplicatedUser = await Admin.findOne({ where: { phone } })
        if (isDuplicatedUser) {
            throw new ConflictException("duplicated admin phone number")
        }
        const hashPassword = await bcrypt.hash(password, 8);
        return Admin.save(Admin.create({
            ...otherData,
            password: hashPassword,
            phone,
        }))
    }

    @Delete(":id")
    async deleteAdmin(@Param("id", ParseIntPipe) id: number) {
        const admin = await Admin.findOne({ where: { id } })
        if (!admin) {
            throw new NotFoundException("admin is not defined")
        }
        return admin.remove();
    }

    @Patch(":id")
    async updateAdmin(@Param("id", ParseIntPipe) id: number, @Body() body: EditAdminDTO) {
        const admin = await Admin.findOne({ where: { id } })
        if (!admin) {
            throw new NotFoundException("admin is not defined")
        }

        const { password, ...otherData } = body;

        if (password) {
            const hashPassword = await bcrypt.hash(password, 8);
            admin.password = hashPassword;
        }

        admin.firstName = otherData.firstName || admin.firstName
        admin.lastName = otherData.lastName || admin.lastName
        admin.phone = otherData.phone || admin.phone
        admin.isActive = typeof otherData.isActive === typeof undefined ? admin.isActive : otherData.isActive

        return admin.save();
    }
}