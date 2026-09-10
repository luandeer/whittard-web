'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/lib/types';
import { ProductRating } from '@/modules/products/components/ProductRating';
import { Button } from '@/shared/components/shadcn-ui/button';
import { Field, FieldError, FieldLabel } from '@/shared/components/shadcn-ui/field';
import { Textarea } from '@/shared/components/shadcn-ui/textarea';

import { reviewService } from '../services/review.service';
import type { ProductReview } from '../types/review';

const reviewFormSchema = z.object({
  rating: z
    .number({ error: 'Selecciona una calificación.' })
    .min(1, { error: 'La calificación debe ser entre 1 y 5.' })
    .max(5, { error: 'La calificación debe ser entre 1 y 5.' }),
  body: z
    .string()
    .trim()
    .min(1, { error: 'El comentario es obligatorio.' })
    .max(5000, { error: 'El comentario no puede superar los 5000 caracteres.' }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  productId: string;
  onCreated: (review: ProductReview) => void;
  onCancel: () => void;
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'status' in value;
}

export function ReviewForm({ productId, onCreated, onCancel }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: standardSchemaResolver(reviewFormSchema),
    mode: 'onTouched',
    defaultValues: { rating: 0, body: '' },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await reviewService.create(productId, {
        rating: values.rating,
        body: values.body.trim(),
      });

      toast.success(response.message);
      form.reset({ rating: 0, body: '' });
      onCreated(response.data);
    } catch (caught) {
      if (isApiError(caught) && caught.errors) {
        const fields = ['rating', 'body'] as const;
        const hasFieldErrors = fields.some((field) => Boolean(caught.errors?.[field]?.length));

        fields.forEach((field) => {
          const messages = caught.errors?.[field];
          if (messages?.length) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        });

        if (!hasFieldErrors) setServerError(caught.message);
      } else if (isApiError(caught)) {
        setServerError(caught.message);
      } else {
        setServerError('No se pudo enviar la reseña. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-xs md:p-7"
    >
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-brand-primary font-brand-elephant text-lg font-semibold">
            Escribe tu reseña
          </h3>
          <p className="text-xs text-gray-400">
            Cuéntanos tu experiencia: aroma, sabor, presentación y servicio.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-500 hover:bg-transparent hover:text-gray-900"
        >
          Cancelar
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <Controller
          name="rating"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-brand-primary block">
                Calificación <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="mt-1.5 flex items-center gap-3">
                <ProductRating
                  value={field.value}
                  onChange={field.onChange}
                  readonly={isSubmitting}
                  allowHalf
                  size="lg"
                />
                {field.value > 0 && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {field.value.toFixed(1)}
                  </span>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="body"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="text-brand-primary block">
                Tu reseña <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={6}
                placeholder="¿Qué te pareció el producto? Comparte los detalles que ayuden a otros clientes."
                disabled={isSubmitting}
                aria-invalid={fieldState.invalid}
                className="mt-1.5 rounded-md"
                maxLength={5000}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {serverError && <p className="text-destructive text-sm">{serverError}</p>}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            Tu reseña quedará pendiente de moderación antes de publicarse.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary hover:bg-brand-primary/90 h-11 rounded-md px-8 text-sm font-semibold tracking-widest text-white uppercase"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar reseña'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
