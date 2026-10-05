import * as React from 'react';
import { Container } from '@/shared/components/Container/Container';
import { BenefitCard } from './BenefitCard';
import { benefitsData } from '../../data/benefits.data';

export const Benefits: React.FC = () => {
  return (
    <section id="como-funciona" className="w-full border-y border-[#ECEDF5] bg-white py-5 sm:py-6">
      <Container variant="wide">
        <div className="grid grid-cols-1 items-center divide-y divide-[#F0F1F6] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {benefitsData.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </Container>
    </section>
  );
};
