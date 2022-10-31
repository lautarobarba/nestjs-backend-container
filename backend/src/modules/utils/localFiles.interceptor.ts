import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
 
interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
}
 
export const LocalFilesInterceptor = (options: LocalFilesInterceptorOptions): Type<NestInterceptor> => {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor() {
      const filesDestination = process.env.UPLOAD_FILE_DETINATION ?? './uploads';
 
      const destination = `${filesDestination}${options.path}`
 
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination
        })
      }
 
      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions));
    }
 
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
