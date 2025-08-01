import { RefObject } from "react"
    export const useDropdownPosition = (
      ref:RefObject<HTMLDivElement|null>|RefObject<HTMLDivElement>
    ) => {
      const getDropdownPosition=()=>{
        if(!ref.current) return {top:0,left:0};
        const rect=ref.current.getBoundingClientRect();
        const dropdownWidth=240;//width of dropdown(w-60=15rem=240px)
        //initial position
        let left=rect.left+window.scrollX;
        const top=rect.bottom+window.scrollY;
        //checking if dropdown is going off
        if(left+dropdownWidth>window.innerWidth){
          //aligning to right edge of button
          left=rect.right+window.scrollX-dropdownWidth;
          //if still off-screen ,align to right edge of view port wit padding
          if(left<0)
          {
            left=window.innerWidth-dropdownWidth-16;
          }
        }
        //dropdown doesn't go off left edge
        if(left<0)
        {
          left=16;
        }
        return {top,left};
      };
      return {getDropdownPosition};
}
