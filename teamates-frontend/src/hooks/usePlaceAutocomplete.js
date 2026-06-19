import { useEffect } from 'react';

export function usePlaceAutocomplete(containerId, onPlaceSelect) {
    useEffect(() => {
        const initAutocomplete = async () => {
            if (!window.google) {
                setTimeout(initAutocomplete, 100);
                return;
            }

            const { PlaceAutocompleteElement } = await window.google.maps.importLibrary('places');
            const placeAutocomplete = new PlaceAutocompleteElement();
            placeAutocomplete.style.width = '100%';

            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                container.appendChild(placeAutocomplete);
            }

            placeAutocomplete.addEventListener('gmp-select', async (event) => {
                const place = event.placePrediction.toPlace();
                await place.fetchFields({ fields: ['location', 'formattedAddress'] });
                onPlaceSelect({
                    lat: place.location.lat(),
                    lng: place.location.lng(),
                    address: place.formattedAddress
                });
            });
        };

        initAutocomplete();
    }, [containerId]);
}