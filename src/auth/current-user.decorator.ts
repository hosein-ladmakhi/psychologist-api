import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Patient } from 'src/users/patient/patient.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';

export const CurrentUser = createParamDecorator(
  async (_: any, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user) {
      return null;
    }
    if (user.role === 'therapist') {
      return Therapist.findOne({
        where: { id: user.userId },
        relations: { workingFields: true },
      });
    } else if (user.role === 'patient') {
      return Patient.findOne({ where: { id: user.userId } });
    }
    return user;
    // return await User.findOne({
    //   where: { id: user.sub },
    //   relations: relations,
    //   cache: options.cache == undefined ? true : options.cache,
    // }); // extract a specific property only if specified or get a user object
  },
);
