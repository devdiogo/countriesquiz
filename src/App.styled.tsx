import styled from "styled-components";

export const Map = styled.div`

  width: 100%;
  height: 100%;
  border: 0px solid black;

  svg {
    width: 100vw;
    height: 100vh;
    stroke: #e2dfdf;
    stroke-width: 0.5px;

    path {
      fill: #5a5a5a;
      cursor: pointer;
      outline: none;

      &:hover {
        fill: #292929;
      }
    }

    path[id='ps'], path[id='gf'], path[id='xk'], path[id='tw'], path[id='eh'], path[id='gl'] {
      cursor: not-allowed;
      fill: #252525 !important;
    }
  }
`;