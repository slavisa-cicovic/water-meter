'use client';

import { useScroll } from 'framer-motion';
import { Box } from '@mui/material';
import MainLayout from 'src/layouts/main';
import ScrollProgress from 'src/components/scroll-progress';
import HomeMinimal from '../home-minimal';


export default function HomeView(){
     const {scrollYProgress} = useScroll();
    return(
        <MainLayout>
             <ScrollProgress scrollYProgress={scrollYProgress} />
            <Box
                sx={{
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: 'background.default',
                }}
            >
                <HomeMinimal />
            </Box>
        </MainLayout>
    )
}