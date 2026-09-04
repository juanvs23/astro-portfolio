import { Schema, model, models, type Model } from 'mongoose';

export interface ProjectDoc {
  name: string;
  url: string;
  desc_es: string;
  desc_en: string;
  imageUrl: string;
  order: number;
  visible: boolean;
}

const projectSchema = new Schema<ProjectDoc>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    desc_es: { type: String, required: true },
    desc_en: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ProjectModel: Model<ProjectDoc> =
  (models.Project as Model<ProjectDoc> | undefined) ?? model('Project', projectSchema);